import { MapTemplate } from "@/sigaflo/templates/MapTemplate";
import { findDomain } from "@/sigaflo/domains/registry";

const DomainMapPage = () => {
  const domain = findDomain("cafe");
  if (!domain) return null;

  return (
    <div className="-m-4 md:-m-7">
      <MapTemplate kinds={domain.mapKinds} points={domain.mapPoints()} areas={domain.mapAreas?.() ?? []} labels={domain.mapLabels} />
    </div>
  );
};

export default DomainMapPage;
