import ComplaintForm from '../../components/complaint/ComplaintForm';
import Navbar from '../../components/layout/Navbar';

export default function SubmitComplaint() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Submit Complaint</h1>
        <p className="mt-1 text-sm text-gray-600">
          Share complete details so the right department can act quickly.
        </p>
        <div className="mt-6">
          <ComplaintForm />
        </div>
      </main>
    </div>
  );
}
