import "./styles.css";
import React, {
  Component,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type AccordionState = { id: string; isOpen: boolean };
const AccordionGroupContext = React.createContext<
  | {
      accordions: AccordionState[];
      toggleAccordion: (id: string) => void;
      subscribe: (id: string) => void;
      unSubscribe: (id: string) => void;
    }
  | undefined
>(undefined);

function useAccordionGroupContext() {
  const context = useContext(AccordionGroupContext);
  if (!context) {
    throw new Error("Gotsa puts the Accordions in the AccordionGroup");
  }
  return context;
}

function useSubscribe() {
  const {
    accordions,
    toggleAccordion,
    subscribe,
    unSubscribe
  } = useAccordionGroupContext();
  const [id] = useState(randomString());
  const toggleIsOpen = () => toggleAccordion(id);
  const isOpen = accordions.find((acc) => acc.id === id)?.isOpen ?? false;

  useEffect(() => {
    subscribe(id);
    return () => {
      unSubscribe(id);
    };
  }, []);

  return { isOpen, toggleIsOpen };
}

const randomString = () => Math.random().toString(36).substring(2, 15);

function AccordionGroup({ children }: PropsWithChildren<{}>) {
  const [accordions, setAccordions] = useState<AccordionState[]>([]);

  const subscribe = (id: string) =>
    setAccordions((prev) => [...prev, { id, isOpen: false }]);

  const unSubscribe = (id: string) =>
    setAccordions((prev) => prev.filter((acc) => acc.id !== id));

  const toggleAccordion = (id: string) =>
    setAccordions((prevAccs) => {
      const selected = prevAccs.find((acc) => acc.id === id);
      if (!selected) {
        return prevAccs;
      }
      const withoutSelected = prevAccs.filter((acc) => acc.id !== id);
      return [
        ...withoutSelected,
        { id: selected.id, isOpen: !selected.isOpen }
      ];
    });

  return (
    <AccordionGroupContext.Provider
      value={{ toggleAccordion, accordions, subscribe, unSubscribe }}
    >
      {children}
    </AccordionGroupContext.Provider>
  );
}

const AccordionContext = React.createContext<
  | {
      isOpen: boolean;
      toggleIsOpen: () => void;
    }
  | undefined
>(undefined);

function Accordion({ children }: PropsWithChildren<{}>) {
  const { isOpen, toggleIsOpen } = useSubscribe();

  return (
    <AccordionContext.Provider value={{ isOpen, toggleIsOpen }}>
      {children}
    </AccordionContext.Provider>
  );
}

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Can't use Header and Panel outside Accordion, yo");
  }
  return context;
}

function Header({ children }: PropsWithChildren<{}>) {
  const { toggleIsOpen } = useAccordionContext();
  return <h2 onClick={toggleIsOpen}>{children}</h2>;
}

function Panel({ children }: PropsWithChildren<{}>) {
  const { isOpen } = useAccordionContext();
  return isOpen ? children : null;
}

export default function App() {
  return (
    <div className="App">
      <AccordionGroup>
        <Accordion>
          <Header>
            <div>Header 1</div>
          </Header>
          <Panel>Panel 1</Panel>
        </Accordion>
        <Accordion>
          <Header>
            <div>Header 2</div>
          </Header>
          <Panel>Panel 2</Panel>
        </Accordion>
      </AccordionGroup>
    </div>
  );
}
