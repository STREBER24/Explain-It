export const wordFiles: Record<
  string,
  {
    name: string
    variants: Record<
      string,
      { description: string; raw_filename: string; graph_filename: string }
    >
  }
> = {
  de: {
    name: "Deutsch",
    variants: {
      standard: {
        description: "Standardvokabular",
        raw_filename: "german_standard.csv",
        graph_filename: "german_standard_graph.csv",
      },
    },
  },
  en: {
    name: "English",
    variants: {
      sports: {
        description: "sports vokabulary",
        raw_filename: "english_sports.csv",
        graph_filename: "english_sports_graph.csv",
      },
      standard: {
        description: "default vokabulary",
        raw_filename: "english_standard.csv",
        graph_filename: "english_standard_graph.csv",
      },
    },
  },
  it: {
    name: "Italiano",
    variants: {
      standard: {
        description: "vocabolario standard",
        raw_filename: "italian_standard.csv",
        graph_filename: "italian_standard_graph.csv",
      },
    },
  },
}
