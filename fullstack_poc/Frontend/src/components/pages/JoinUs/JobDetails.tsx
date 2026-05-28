import { capitalize } from 'lodash';
import React from 'react';
import { AiFillCompass } from 'react-icons/ai';
import { GiTakeMyMoney } from 'react-icons/gi';
import { MdAddLocationAlt } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';

import MarkdownComponents from '@/components/pages/Blog/SingleBlog/MarkDownImage';
import { JobOpening } from '@/components/pages/JoinUs/CurrentOpenings';
import Button from '@/components/Utility/Button';
import Heading from '@/elements/Heading';
import Label from '@/elements/Label';
import Text from '@/elements/Text';

interface JobDetailsProps {
  jobDetails: JobOpening;
  onApply: (role: string) => void;
}

function JobDetails({ jobDetails, onApply }: JobDetailsProps) {
  const location = jobDetails?.attributes?.job_location?.data?.attributes?.City;

  return (
    <div className="">
      <div className="job-details">
        <div className="pb-4 lg:pb-0">
          <Heading priority={3}>{jobDetails?.attributes?.jobRole}</Heading>
          <Text size="sm">Posted: {jobDetails?.attributes?.jobPostedDate}</Text>
        </div>
        <Button onClick={() => onApply(jobDetails?.attributes?.jobRole)}>
          Apply Now
        </Button>
      </div>
      <div className="job-req">
        <div className="job-flex">
          <span className="job bg-green">
            <MdAddLocationAlt />
          </span>
          <Text size="base" color="text-primary">
            {capitalize(location)}
            <p className="sub-job-heading">Location</p>
          </Text>
        </div>
        <div className="job-flex">
          <span className="job bg-yellow">
            <GiTakeMyMoney />
          </span>
          <Text size="sm" color="text-primary">
            {jobDetails?.attributes?.salary != null
              ? capitalize(jobDetails?.attributes?.salary) + "Lac's"
              : 'Not Disclosed'}
            <p className="sub-job-heading">Salary</p>
          </Text>
        </div>
        <div className="job-flex">
          <span className="job bg-blue-400 ">
            <AiFillCompass />
          </span>
          <Text size="sm" color="text-primary">
            {capitalize(jobDetails?.attributes?.experience) + ' years +'}
            <p className="sub-job-heading">Experience</p>
          </Text>
        </div>
      </div>
      <Label variant title="Description" />
      <div className=" job-section w-full">
        <ul>
          <ReactMarkdown components={MarkdownComponents}>
            {jobDetails?.attributes?.jobDescription}
          </ReactMarkdown>
        </ul>
      </div>
    </div>
  );
}

export default JobDetails;
