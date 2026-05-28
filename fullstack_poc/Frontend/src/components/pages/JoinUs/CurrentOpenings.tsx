import React, { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

import ApplyAnotherProfile from '@/components/pages/JoinUs/ApplyAnotherProfile';
import JobDetails from '@/components/pages/JoinUs/JobDetails';
import ResumeUploadFlow from '@/components/pages/JoinUs/ResumeUploadFlow';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';

import ImgCurrentOpeneing from '../../../../public/images/Opening.png';

interface JobAttributes {
  title: string;
  description: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  jobDescription: string;
  status: 'open' | 'closed';
  jobPostedDate: string;
  jobRole: string;
  job_location?: {
    data: {
      attributes: {
        City: string;
      };
    };
  };
  department?: {
    data: {
      attributes: {
        Name: string;
      };
    };
  };
  employment_type?: {
    data: {
      attributes: {
        employmentType: string;
      };
    };
  };
}

export interface JobOpening {
  id: string;
  attributes: JobAttributes;
}

interface CurrentOpeningsProps {
  jobOpenings: JobOpening[];
}

export default function CurrentOpenings({ jobOpenings }: CurrentOpeningsProps) {
  const [resumeOpen, setResumeOpen] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobOpening | null>(null);
  const [jobDetailsModal, setJobDetailsModal] = useState(false);
  const [resumeSteps, setResumeSteps] = useState(0);
  const [role, setRole] = useState<JobOpening | string>('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  function handleApplyNow(step: number, jobInfo: JobOpening | string) {
    setResumeSteps(step);
    setRole((jobInfo as JobOpening)?.attributes?.jobRole);
    setResumeOpen(!resumeOpen);
    setJobDetails(jobInfo as JobOpening);
  }

  function handleViewJob(data: JobOpening) {
    setJobDetailsModal(true);
    setJobDetails(data);
  }
  const location = jobDetails?.attributes?.job_location?.data?.attributes?.City;
  const department = jobDetails?.attributes?.department?.data?.attributes?.Name;
  const employmentType =
    jobDetails?.attributes?.employment_type?.data?.attributes?.employmentType;

  return (
    <>
      <Modal
        id="CurrentOpenings"
        isVisible={resumeOpen}
        onClose={() => {
          setResumeOpen(false);
          setJobDetailsModal(false);
        }}
      >
        <ResumeUploadFlow
          resumeSteps={resumeSteps}
          setResumeSteps={setResumeSteps}
          role={role as string}
          handleClose={() => {
            setResumeOpen(false);
            setJobDetailsModal(false);
          }}
          department={(department as string)?.toUpperCase()}
          location={(location as string)?.toUpperCase()}
          employmentType={employmentType as string}
        />
      </Modal>
      <Modal
        id="jobDetailsModal"
        isVisible={jobDetailsModal}
        onClose={() => setJobDetailsModal(false)}
      >
        <JobDetails
          jobDetails={jobDetails as JobOpening}
          onApply={() => handleApplyNow(0, role)}
        />
      </Modal>
      <div className="sm-container" id="Current openings">
        <div className="grid grid-cols-12 items-center lg:mb-10 mb-5">
          <div className="lg:col-span-8 col-span-10">
            <Text>
              <p className="text-[30px] font-bold lg:text-[59px] mb-1">
                Current openings
              </p>
            </Text>
            <Text>
              <p className="lg:text-[25px] text-base">
                Grow with us at Kofuku - where creativity and passion thrive.
              </p>
            </Text>
          </div>
          <div className="lg:col-span-4 col-span-2 flex justify-end items-center">
            <div className="lg:w-[207px] w-20">
              <CustomImage
                src={ImgCurrentOpeneing}
                alt="Current Openings"
                width={150}
                height={150}
              />
            </div>
          </div>
        </div>

        <div className=" max-h-[300px] overflow-y-auto">
          <ul>
            {jobOpenings &&
              jobOpenings.map((data: JobOpening) => {
                return (
                  <li
                    key={data.id}
                    className="mb-4 rounded-md  border-[1px] p-2.5 lg:mb-0  lg:border-none "
                  >
                    <div className="items-center justify-center lg:flex lg:justify-between">
                      <Text>
                        <span
                          onClick={() => handleViewJob(data)}
                          className="cursor-pointer text-lg font-bold text-primary lg:text-2xl"
                        >
                          {data?.attributes?.jobRole}
                        </span>
                      </Text>
                      <div className="flex items-center justify-between gap-4 pt-4">
                        <div
                          onClick={() => handleViewJob(data)}
                          className="flex cursor-pointer items-center space-x-2"
                        >
                          <Text>
                            <p className="text-md lg:text-2xl">View details</p>
                          </Text>
                          <IoIosArrowDown />
                        </div>

                        <div className="">
                          <Button
                            size="lg"
                            type="secondary"
                            onClick={() => handleApplyNow(0, data)}
                          >
                            Apply now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            {jobOpenings.length <= 0 && (
              <div className="text-center">
                {' '}
                <Text size="lg" color="text-primary">
                  Sorry, There are currently no vacancies available
                </Text>
              </div>
            )}
          </ul>
        </div>
        {/* {!showApplyForm && (
          <div className=" py-10 font-bold">
            <Text>
              If your profile is not listed above, send your resume{' '}
              <span
                className="relative cursor-pointer text-primary"
                onClick={() => setShowApplyForm(true)}
              >
                here!
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"></span>
              </span>
            </Text>
          </div>
        )} */}
        {/* {showApplyForm && ( */}
        <ApplyAnotherProfile setShowApplyForm={setShowApplyForm} />
        {/* )} */}
      </div>
    </>
  );
}
