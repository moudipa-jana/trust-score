import { Dispatch } from 'react';

import Resume from '@/components/pages/JoinUs/ResumeUploadFlow/Resume';
import Success from '@/components/Utility/Success';

interface ResumeUploadFlowProps {
  setResumeSteps: Dispatch<React.SetStateAction<number>>;
  resumeSteps: number;
  role: string;
  handleClose: () => void;
  department: string;
  location: string;
  employmentType: string;
}

export default function ResumeUploadFlow({
  setResumeSteps,
  resumeSteps,
  role,
  handleClose,
  department,
  location,
  employmentType,
}: ResumeUploadFlowProps) {
  if (resumeSteps === 0) {
    return (
      <Resume
        setResumeSteps={setResumeSteps}
        role={role}
        department={department}
        location={location}
        employmentType={employmentType}
      />
    );
  }

  if (resumeSteps === 1) {
    return (
      <Success
        isActive={resumeSteps === 1}
        title="Your resume submitted successfully"
        autoClose={handleClose}
      />
    );
  }
  return <div>Not Found</div>;
}
