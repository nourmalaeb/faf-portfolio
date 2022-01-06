import { styled } from '../stiches.config';

const Loader = styled('div', {
  width: `100px`,
  height: `20px`,
  position: `relative`,
  '& svg': {
    position: `absolute`,
    width: `100%`,
    height: `100%`,
  },
});

const LoadingAnim = () => (
  <Loader>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <circle cx="84" cy="50" r="10" fill="#353535">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;1"
          values="10;0"
          keySplines="0 0.5 0.5 1"
          begin="0s"
        ></animate>
        <animate
          attributeName="fill"
          repeatCount="indefinite"
          dur="4s"
          calcMode="discrete"
          keyTimes="0;0.25;0.5;0.75;1"
          values="#353535;#d4d4d4;#9b9b9b;#666666;#353535"
          begin="0s"
        ></animate>
      </circle>
      <circle cx="16" cy="50" r="10" fill="#353535">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="0s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="0s"
        ></animate>
      </circle>
      <circle cx="50" cy="50" r="10" fill="#666666">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-1s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-1s"
        ></animate>
      </circle>
      <circle cx="84" cy="50" r="10" fill="#9b9b9b">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-2s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-2s"
        ></animate>
      </circle>
      <circle cx="16" cy="50" r="10" fill="#d4d4d4">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-3s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-3s"
        ></animate>
      </circle>
    </svg>
  </Loader>
);

export default LoadingAnim;
