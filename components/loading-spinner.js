import './loading-spinner.css';

const LoadingAnim = () => (
  <div className="loading-spinner">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 75 25"
      preserveAspectRatio="xMidYMid"
    >
      <rect width="25" height="2" x="25" y="11.5" fill="black">
        <animateTransform
          attributeName="transform"
          type="rotate"
          dur="3s"
          repeatCount="indefinite"
          keyTimes="0;1"
          values="0 37.5 11.5;360 37.5 11.5"
        ></animateTransform>
      </rect>
    </svg>
  </div>
);

export default LoadingAnim;
