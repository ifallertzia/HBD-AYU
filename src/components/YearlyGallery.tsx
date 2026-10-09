import React, { useState, useEffect } from 'react';
import { MemoryPhoto } from '../types';
import { Image, Plus, Trash2, Calendar, Maximize2, X, Sparkles, Upload, Camera, CheckCircle2 } from 'lucide-react';
import { birthdayAudio } from '../utils/audio';
import confetti from '../utils/confetti';

const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error(`Could not read ${file.name}.`));
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });

const uploadPhoto = async (file: File) => {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: use a JPEG, PNG, WebP, or GIF image.`);
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error(`${file.name}: photos must be smaller than 8 MB.`);
  }

  const response = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl: await readFileAsDataUrl(file) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Photo upload failed.');
  return data.imageUrl as string;
};

export const YearlyGallery: React.FC = () => {
  const [memories, setMemories] = useState<MemoryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<MemoryPhoto | null>(null);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Form states
  const [formYear, setFormYear] = useState<number>(2026);
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTag, setFormTag] = useState('Birthday');
  const [formDate, setFormDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isBatchUploading, setIsBatchUploading] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

 const fetchMemories = async () => {
  try {
    setLoading(true);

    const res = await fetch('/memories.json');

    if (!res.ok) {
      throw new Error('Could not load memories.json');
    }

    const data = await res.json();

    setMemories(data);
  } catch (err) {
    console.error('Failed to load memories:', err);
  } finally {
    setLoading(false);
  }
};

  const showNotification = (msg: string) => {
    setUploadToast(msg);
    setTimeout(() => setUploadToast(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      setFormImageUrl(await uploadPhoto(file));
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Direct replacement for a specific card
  const handleCardPhotoReplace = async (memoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const imageUrl = await uploadPhoto(file);
      const res = await fetch(`/api/memories/${memoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update this memory.');
      birthdayAudio.playSparkleChime();
      setMemories((prev) => prev.map((memory) => (memory.id === memoryId ? data.memory : memory)));
      showNotification(`✨ Photo successfully incorporated for ${data.memory.title}!`);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Could not update this memory.');
    }
  };

  // Save each selected photo as a new public memory.
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = '';
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    if (fileList.length > 20) {
      showNotification('Choose up to 20 photos at a time.');
      return;
    }

    setIsBatchUploading(true);
    showNotification(`Adding ${fileList.length} photos to Ayush's public gallery...`);
    const addedMemories: MemoryPhoto[] = [];
    const errors: string[] = [];

    for (const file of fileList) {
      try {
        const imageUrl = await uploadPhoto(file);
        const title = file.name.replace(/\.[^.]+$/, '').trim().slice(0, 80) || 'A sweet memory';
        const response = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: new Date().getFullYear(),
            title,
            caption: '',
            imageUrl,
            tag: 'Memory',
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Could not add ${file.name}.`);
        addedMemories.push(data.memory);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : `Could not add ${file.name}.`);
      }
    }

    if (addedMemories.length) {
      setMemories((prev) => [...prev, ...addedMemories].sort((a, b) => a.year - b.year));
      birthdayAudio.playSparkleChime();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
    if (errors.length) {
      showNotification(`${addedMemories.length} photo(s) added; ${errors.length} failed. ${errors[0]}`);
    } else {
      showNotification(`🎉 ${addedMemories.length} photo(s) added to the public gallery!`);
    }
    setIsBatchUploading(false);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImageUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: formYear,
          title: formTitle,
          caption: formCaption,
          imageUrl: formImageUrl,
          tag: formTag,
          date: formDate || `October 13, ${formYear}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save memory.');
      birthdayAudio.playSparkleChime();
      setMemories((prev) => [...prev, data.memory].sort((a, b) => a.year - b.year));
      setIsAddModalOpen(false);
      setFormTitle('');
      setFormCaption('');
      setFormImageUrl('');
      setFormDate('');
      showNotification('✨ New memory added to the public gallery!');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to save memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this photo memory?')) return;
    try {
      const response = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove memory.');
      setMemories((prev) => prev.filter((m) => m.id !== id));
      if (activePhoto?.id === id) setActivePhoto(null);
      showNotification('Memory removed.');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to remove memory.');
    }
  };

  // Get unique list of available years
  const yearsList = Array.from(new Set(memories.map((m) => m.year))).sort((a, b) => a - b);

  // Filter memories
  const filteredMemories =
    selectedYear === 'ALL'
      ? memories
      : memories.filter((m) => m.year === selectedYear);

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur-md p-6 md:p-8 border border-rose-100 shadow-xl shadow-rose-100/30 relative">
      {/* Toast Notification */}
      {uploadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900/90 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-sm animate-fade-in border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{uploadToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <Image className="w-3.5 h-3.5 text-rose-500" />
            <span>Year-By-Year Scrapbook</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-800 mt-1">
            Ayush&apos;s Yearly Memory Gallery
          </h2>
          <p className="text-sm text-gray-500">
            Chronological photo archive from bbyyy Ayu&apos;s birth (2005) up through 2026 and future years.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Batch uploads create new public gallery entries */}
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all${isBatchUploading ? ' opacity-60 cursor-wait' : ' hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'}`}>
            <Upload className="w-4 h-4" />
            <span>{isBatchUploading ? 'Adding Photos...' : 'Upload Photos'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBatchUpload}
              disabled={isBatchUploading}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-rose-700 font-bold text-xs border border-rose-200 hover:bg-rose-50 shadow-xs hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Public contribution notice */}
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-200/80 text-rose-700 flex items-center justify-center text-lg shrink-0">
            📸
          </div>
          <div>
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <span>Share a photo memory with everyone</span>
            </div>
            <p className="text-gray-600 mt-0.5">
              Photos added here are public. Only upload pictures you have permission to share. Batch photos use this year; use Add Memory to choose another year. Up to 20 photos (8 MB each).
            </p>
          </div>
        </div>

        <label className={`shrink-0 px-3.5 py-1.5 rounded-xl bg-white text-rose-700 font-bold border border-rose-200 shadow-2xs${isBatchUploading ? ' opacity-60 cursor-wait' : ' hover:bg-rose-50 cursor-pointer'}`}>
          <span>{isBatchUploading ? 'Adding Photos...' : 'Choose Photos'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleBatchUpload}
            disabled={isBatchUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Year Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
        <button
          onClick={() => setSelectedYear('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedYear === 'ALL'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-rose-50/70 text-gray-700 hover:bg-rose-100 border border-rose-100'
          }`}
        >
          All Years ({memories.length})
        </button>

        {yearsList.map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedYear === yr
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-rose-50/70 text-gray-700 hover:bg-rose-100 border border-rose-100'
            }`}
          >
            {yr} (Age {yr - 2005})
          </button>
        ))}
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading sweet memories...</div>
      ) : filteredMemories.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-sm">No photos saved for this year yet.</p>
          <button
            onClick={() => {
              if (typeof selectedYear === 'number') setFormYear(selectedYear);
              setIsAddModalOpen(true);
            }}
            className="mt-3 text-xs text-rose-600 font-semibold underline hover:text-rose-700"
          >
            Be the first to upload a memory for {selectedYear}!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setActivePhoto(mem)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-rose-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Photo Box */}
              <div className="relative aspect-4/3 w-full bg-rose-50 overflow-hidden">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback placeholder
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Year & Age Pill Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-amber-300" />
                  <span>{mem.year} &bull; Age {mem.age}</span>
                </div>

                {/* Tag pill */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  {mem.tag}
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="p-2 rounded-full bg-white/90 text-gray-800 shadow-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Per-card quick upload button on bottom corner of image */}
                <label
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-md backdrop-blur-xs cursor-pointer hover:scale-110 active:scale-95 transition-all flex items-center gap-1 text-[11px] font-bold"
                  title="Upload / Change Photo for this memory"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCardPhotoReplace(mem.id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Caption & Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-gray-800 text-base group-hover:text-rose-600 transition-colors">
                    {mem.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {mem.caption}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  <span>{mem.date}</span>
                  <button
                    onClick={(e) => handleDeleteMemory(mem.id, e)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-md"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <h3 className="text-lg font-serif font-bold text-gray-800">
                  Store a Memory for Ayush
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Year (2005 - 2030)
                  </label>
                  <input
                    type="number"
                    min={2005}
                    max={2030}
                    value={formYear}
                    onChange={(e) => setFormYear(parseInt(e.target.value, 10))}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                    required
                  />
                  <span className="text-[10px] text-gray-400">
                    Age: {Math.max(0, formYear - 2005)} years old
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Childhood">Childhood</option>
                    <option value="Sweet 16">Sweet 16</option>
                    <option value="Travel">Travel &amp; Adventure</option>
                    <option value="Friends & Family">Friends &amp; Family</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 21st Birthday Celebration / First Trip"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Upload Photo or Paste Image URL
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                {formImageUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Caption &amp; Story (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell the story behind this picture..."
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`e.g. October 13, ${formYear}`}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto || !formImageUrl}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm shadow-md shadow-rose-200 hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Memory...' : 'Save Picture ✨'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl cursor-default animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-1 text-xs text-rose-600 font-bold uppercase tracking-wider">
                <span>{activePhoto.year}</span>
                <span>&bull;</span>
                <span>Age {activePhoto.age}</span>
                <span>&bull;</span>
                <span>{activePhoto.tag}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-800">
                {activePhoto.title}
              </h3>
              {activePhoto.caption && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {activePhoto.caption}
                </p>
              )}
              <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span>{activePhoto.date}</span>
                <span className="font-handwriting text-rose-500 text-base font-bold">
                  Ayush &hearts; cupcakeee memory
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
