import { BlogDetails } from './SingleBlogBody';

interface TableOfContentsProps {
  blogDetails: BlogDetails;
}

export default function TableOfContents({
  blogDetails,
}: TableOfContentsProps) {
  // Extract all fold titles that have a Title property
  const foldTitles: Array<{ title: string; id: string }> = [];

  const folds = [
    blogDetails?.attributes?.firstFold,
    blogDetails?.attributes?.secondFold,
    blogDetails?.attributes?.thirdFold,
    blogDetails?.attributes?.fourthFold,
    blogDetails?.attributes?.fifthFold,
    blogDetails?.attributes?.sixthFold,
    blogDetails?.attributes?.seventhFold,
    blogDetails?.attributes?.eighthFold,
    blogDetails?.attributes?.ninthFold,
    blogDetails?.attributes?.tenthFold,
    blogDetails?.attributes?.eleventhFold,
    blogDetails?.attributes?.twelfthFold,
    blogDetails?.attributes?.thirteenthFold,
    blogDetails?.attributes?.fourteenthFold,
    blogDetails?.attributes?.fifteenthFold,
  ];

  folds.forEach((fold, index) => {
    if (fold?.Title && fold.Title.trim() !== '') {
      const id = `fold-${index + 1}`;
      foldTitles.push({
        title: fold.Title,
        id: id,
      });
    }
  });

  if (foldTitles.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.querySelector(`[data-fold-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{
        width: '1200px',
        maxWidth: '100%',
        minHeight: '224px',
        opacity: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingTop: '12px',
        paddingRight: '24px',
        paddingBottom: '12px',
        paddingLeft: '24px',
        borderRadius: '12px',
        borderWidth: '1px',
        border: '1px solid #D9D9D9',
      }}
    >
      {/* Title with 3 lines icon */}
      <div className="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: '#272727' }}
        >
          <path
            d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h3
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '24px',
            letterSpacing: '0%',
            color: '#272727',
            margin: 0,
          }}
        >
          Table of content
        </h3>
      </div>

      {/* Content items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {foldTitles.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className="text-left hover:underline transition-colors flex items-start gap-2"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '0%',
              color: '#00B2ED',
              padding: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                color: '#00B2ED',
                marginTop: '4px',
                flexShrink: 0,
              }}
            >
              •
            </span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

