import EstimateCalculator from "@/components/dashboard/EstimateCalculator";
import { useAuth } from "@/contexts/AuthContext";

const PartnerEstimates = () => {
  const { user } = useAuth();
  return <EstimateCalculator role="partner" userName={user?.name || "Партнёр"} />;
};
export default PartnerEstimates;
