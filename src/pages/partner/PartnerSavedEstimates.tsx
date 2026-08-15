import SavedEstimates from "@/components/dashboard/SavedEstimates";
import { useAuth } from "@/contexts/AuthContext";

const PartnerSavedEstimates = () => {
  const { user } = useAuth();
  return <SavedEstimates role="partner" userName={user?.name || "Партнёр"} />;
};
export default PartnerSavedEstimates;
