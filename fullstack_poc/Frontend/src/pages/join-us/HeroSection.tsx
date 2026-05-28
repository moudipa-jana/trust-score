import Heading from "@/elements/Heading";
import TextCarousel from "./TextCarousel";
import CustomImage from "@/components/Utility/CustomImage";
import Button from "@/components/Utility/Button";
import HeroImg from '../../../public/images/Join Us_Hero image.png';

const HeroSection = () => {

    const handleExploreJobsClick = () => {
        const currentOpeningsSection = document.getElementById('current_openings');
        if (currentOpeningsSection) {
            const elementPosition = currentOpeningsSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 90;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            <section className="join-us-hero-section">
                <div className="sm-container py-4 relative">
                    <div className="lg:block hidden">
                        <Heading priority={1} color="text-[#AEAEAE]" variant="bold">
                            Become a part of our team{' '}
                        </Heading>
                    </div>
                    <div className="grid grid-cols-12 gap-4 my-4">
                        <div className="col-span-12 lg:col-span-8 lg:order-first order-last">
                            <div className="lg:hidden block mb-5">
                                <Heading priority={1} color="text-[#AEAEAE] " variant="bold">
                                    Become a part of our team{' '}
                                </Heading>
                            </div>
                            {/* <TextCarousel /> */}
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex lg:justify-end justify-start items-center lg:order-last order-first lg:h-[280px]">
                            <div className="lg:absolute relative lg:bottom-[-60px] lg:min-w-[400px] -right-[50px]">
                                <CustomImage
                                    src={HeroImg}
                                    alt="Join Us Hero Image"
                                    width={400}
                                />
                            </div>
                        </div>
                    </div>
                    <Button type="primary w-full" size="lg" customClassName="lg:w-[400px] w-full lg:mb-10 mb-5" onClick={handleExploreJobsClick}>
                        Explore Our Jobs
                    </Button>
                </div>
            </section>
        </>
    );
}
export default HeroSection;