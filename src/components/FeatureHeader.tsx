import type { FC } from "react";

type Props = {
  title: string;
  descripiton: string;
};

const FeatureHeader: FC<Props> = (props) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-widest text-ink">{props.title}</h2>
      <p className="text-base text-body mx-auto">{props.descripiton}</p>
      <hr className="border-t border-hairline mb-6" />
    </div>
  );
};

export default FeatureHeader;
