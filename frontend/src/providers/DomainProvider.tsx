import { createContext, PropsWithChildren, useContext, useState } from "react";

import { Domain, Goal, Tag } from "@/types/domain";
import MOCK_DOMAINS from "@assets/fake_data/domain";
type DomainData = {
  domains: Domain[];
  setDomains: (domains: Domain[]) => void;
  goals?: Goal[];
  tags?: Tag[];
  setGoals?: (goals: Goal[]) => void;
  setTags?: (tags: Tag[]) => void;
};

const DomainContext = createContext<DomainData>({
  domains: [],
  setDomains: () => {},
  goals: [],
  setGoals: () => {},
  tags: [],
  setTags: () => {},
});

const DomainProvider = ({ children }: PropsWithChildren) => {
  const [domains, setDomains] = useState<Domain[]>(MOCK_DOMAINS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  return (
    <DomainContext.Provider
      value={{ domains, setDomains, goals, setGoals, tags, setTags }}
    >
      {children}
    </DomainContext.Provider>
  );
};

export default DomainProvider;
export const useDomain = () => useContext(DomainContext);
