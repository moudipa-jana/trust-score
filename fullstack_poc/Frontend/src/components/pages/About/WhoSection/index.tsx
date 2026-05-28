import Button from '@/components/Utility/Button';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import Link from 'next/link';

function Who({ title, description }: { title: string; description: string }) {
  return (
    <div id="section3">
      <div className="innerContent">
        <div className="pb-8 text-center ">
          <Heading priority="4" variant="lg" font="font-black">
            <span className="sectionTitle font-headingBold font-extrabold">
              {title}
            </span>
          </Heading>
        </div>
        <div className="whoText sectionDesc">
          <Text customClass="lg:!text-base mb-5">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </Text>
          <Link href="/" >
            <Button
              type='primary'
              customClassName='xl:w-[90%] md:w-[50%] w-[60%] '
            >
              Visit Kofuku
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Who;
