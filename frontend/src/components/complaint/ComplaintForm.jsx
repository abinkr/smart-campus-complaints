import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { ImagePlus, Send } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useSubmitComplaint } from '../../hooks/useComplaints';
import Button from '../ui/Button';
import Input from '../ui/Input';

const complaintSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
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
    <form className="card space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="title"
        label="Title"
        placeholder="Water leak near Block A"
        error={errors.title?.message}
        {...register('title')}
      />
      <Input
        id="description"
        as="textarea"
        label="Description"
        placeholder="Describe the issue in detail, including location and urgency."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="space-y-1.5">
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Proof Image
        </label>
        <div
          className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            assignFile(file);
          }}
        >
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={16} />
            Choose Image
          </button>
          <p className="mt-2 text-xs text-gray-500">Drag and drop is supported. Max 5MB.</p>
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
            className="sr-only"
            onChange={(event) => assignFile(event.target.files?.[0])}
          />
          {imageFile && (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
              <img
                src={previewUrl}
                alt={`Preview of selected image for complaint titled ${watch('title') || 'new complaint'}`}
                className="max-h-48 w-full rounded object-cover"
              />
            </div>
          )}
        </div>
        {errors.image?.message && <p className="text-xs text-red-600">{errors.image.message}</p>}
      </div>

      <Button type="submit" loading={mutation.isPending} className="inline-flex items-center gap-2">
        <Send size={16} />
        Submit Complaint
      </Button>
    </form>
  );
}
