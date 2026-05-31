import ComplaintForm from '../../components/complaint/ComplaintForm';
import Navbar from '../../components/layout/Navbar';

export default function SubmitComplaint() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow w-full px-gutter py-section-gap max-w-container-max mx-auto">
        {/* Header Area */}
        <div className="mb-8 max-w-[800px] mx-auto text-center md:text-left">
          <h1 className="font-display-lg text-display-lg text-primary mb-2">Lodge a New Complaint</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Please provide detailed information below to help us process your request efficiently.
            Fields marked with an asterisk are required.
          </p>
        </div>
        {/* Form Card */}
        <ComplaintForm />
      </main>
    </div>
  );
}

