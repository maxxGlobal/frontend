type StarRatingProps = {
  rating: number;
  ratingHandler: (value: number) => void;
  hoverRating: number;
  hoverHandler: (value: number) => void;
};

const StarRating = ({
  rating,
  ratingHandler,
  hoverRating,
  hoverHandler,
}: StarRatingProps) => (
  <div className="star-rating flex">
    {[...Array(5)].map((_, index) => {
      const starIndex = index + 1;
      return (
        <button
          type="button"
          key={starIndex}
          className={
            starIndex <= (hoverRating || rating) ? "text-qyellow" : "text-qgray"
          }
          onClick={() => ratingHandler(starIndex)}
          onMouseEnter={() => hoverHandler(starIndex)}
          onMouseLeave={() => hoverHandler(rating)}
        >
          <svg
            width="19"
            height="18"
            viewBox="0 0 19 18"
            fill="none"
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" />
          </svg>
        </button>
      );
    })}
  </div>
);

export default StarRating;
