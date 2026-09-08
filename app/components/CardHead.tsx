type CardHeadProps = {
  left: string;
  right: string;
};

export default function CardHead({ left, right }: CardHeadProps) {
  return (
    <div className="card-head">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
