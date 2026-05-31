import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useSubmitComplaint } from '../../hooks/useComplaints';

const complaintSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description cannot exceed 5000 characters'),
  image: z.instanceof(FileList).optional()
});

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxFileSize = 5 * 1024 * 1024;

function sanitizeText(value) {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

function validateImage(file) {
  if (!file) return null;
  if (!allowedTypes.has(file.type)) return 'Only JPEG, PNG, and WebP images are allowed.';
  if (file.size > maxFileSize) return 'Image size must be 5MB or below.';
  return null;
}

export default function ComplaintForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const mutation = useSubmitComplaint();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: '',
      description: '',
      image: undefined
    }
  });
  const imageField = register('image');

  const imageFile = watch('image')?.[0] || null;
  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function assignFile(file) {
    const imageError = validateImage(file);
    if (imageError) {
      setError('image', { type: 'manual', message: imageError });
      return;
    }

    const transfer = new DataTransfer();
    if (file) {
      transfer.items.add(file);
    }
    clearErrors('image');
    setValue('image', transfer.files, { shouldValidate: true, shouldDirty: true });
  }

  async function onSubmit(values) {
    const imageError = validateImage(values.image?.[0]);
    if (imageError) {
      setError('image', { type: 'manual', message: imageError });
      return;
    }

    const formData = new FormData();
    formData.append('title', sanitizeText(values.title));
    formData.append('description', sanitizeText(values.description));
    if (values.image?.[0]) {
      formData.append('image', values.image[0]);
    }

    try {
      await mutation.mutateAsync(formData);
      toast.success('Complaint submitted successfully');
      reset();
      navigate('/history');
    } catch {
      // Error toast is handled centrally in the mutation hook.
    }
  }

  return (
    <div className="max-w-[800px] mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 shadow-sm relative overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 relative z-10">
        {/* Section 1: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label-base" htmlFor="title">Complaint Title *</label>
            <input
              type="text"
              id="title"
              placeholder="Brief summary of the issue"
              className={`input-base ${errors.title ? 'border-red-500' : ''}`}
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label-base" htmlFor="category">Category (Auto-classified)</label>
            <select id="category" className="select-base opacity-75 cursor-not-allowed" disabled>
              <option>Will be automatically detected by AI</option>
            </select>
          </div>

          <div>
            <label className="label-base" htmlFor="priority">Priority Level (Auto-classified)</label>
            <select id="priority" className="select-base opacity-75 cursor-not-allowed" disabled>
              <option>Will be automatically detected by AI</option>
            </select>
          </div>
        </div>

        <hr className="border-t border-outline-variant border-opacity-50" />

        {/* Section 2: Details */}
        <div>
          <label className="label-base" htmlFor="description">Detailed Description *</label>
          <textarea
            id="description"
            rows="5"
            placeholder="Describe the issue, steps taken, and any relevant context..."
            className={`w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface p-4 focus:outline-none focus:border-primary-container focus:ring-0 transition-all duration-200 resize-y min-h-[160px] shadow-sm hover:border-outline ${
              errors.description ? 'border-red-500' : ''
            }`}
            {...register('description')}
          ></textarea>
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        {/* Section 3: Attachments */}
        <div>
          <span className="label-base mb-2">Supporting Evidence (Optional)</span>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              assignFile(file);
            }}
            className="w-full border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low hover:bg-surface transition-colors duration-200 cursor-pointer p-8 flex flex-col items-center justify-center text-center group"
          >
            <div className="h-12 w-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: '24px' }}>
                cloud_upload
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface mb-1">
              <span className="font-bold">Click to upload</span> or drag and drop
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant">
              PNG, JPG, or WebP (max. 5MB)
            </p>
            <input
              id="image"
              ref={(element) => {
                fileInputRef.current = element;
                imageField.ref(element);
              }}
              name={imageField.name}
              onBlur={imageField.onBlur}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => assignFile(event.target.files?.[0])}
            />
          </div>

          {imageFile && (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-48 w-full rounded object-cover"
              />
            </div>
          )}
          {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image.message}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4 pt-6 border-t border-outline-variant border-opacity-50">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-[12px] rounded border border-outline-variant text-primary-container font-label-md text-label-md hover:bg-surface-container-low transition-colors text-center cursor-pointer"
            type="button"
          >
            Cancel
          </button>
          <button
            disabled={mutation.isPending}
            className="px-6 py-[12px] rounded bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors text-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}

