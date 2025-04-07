import './details.css';

const Details = ({ details }) => {
  // console.log(details);
  return (
    <div className="details-container">
      {details.map(detail => (
        <p className="detail" key={`details-${detail._key}`}>
          <span className="detail-header">{detail.header} </span>
          <span className="detail-body">{detail.body}</span>
        </p>
      ))}
    </div>
  );
};

export default Details;
