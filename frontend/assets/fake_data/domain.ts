const MOCK_DOMAINS = [
  {
    id: "domain_1",
    order: 1,
    name: "Imitation",
    goalCount: 1,
    goals: [
      {
        id: "goal_1_1",
        order: 1,
        description:
          "Child can imitate 3 play actions with a doll, teddy bear (spoon-feeding, holding a cup to drink, wiping mouth) with 70% success with support",
        isSelected: false,
        resultProgress: 70,
        tags: [
          {
            id: "tag_repeat",
            text: "Repeated goal",
          },
          {
            id: "tag_support_physical",
            text: "Partial physical support",
          },
        ],
      },
      {
        id: "goal_1_2",
        order: 2,
        description:
          "Child can imitate 3 play actions with a doll, teddy bear (spoon-feeding, holding a cup to drink, wiping mouth) with 70% success with support",
        isSelected: false,
        resultProgress: 70,
        tags: [
          {
            id: "tag_repeat",
            text: "Repeated goal",
          },
          {
            id: "tag_support_physical",
            text: "Partial physical support",
          },
        ],
      },
    ],
  },
  {
    id: "domain_2",
    order: 2,
    name: "Expressive language",
    goalCount: 1,
    goals: [
      {
        id: "goal_2_1",
        order: 1,
        description:
          "Different types of cries for different types of discomfort",
        isSelected: false,
        resultProgress: 40,
        tags: [
          {
            id: "tag_repeat",
            text: "Repeated goal",
          },
          {
            id: "tag_support_modeling",
            text: "Modeling",
          },
        ],
      },
    ],
  },
  {
    id: "domain_3",
    order: 3,
    name: "Cognition",
    goalCount: 1,
    goals: [
      {
        id: "goal_3_1",
        order: 1,
        description: "Comes after a verbal command (without tools/objects)",
        isSelected: false,
        resultProgress: 60,
        tags: [
          {
            id: "tag_repeat",
            text: "Repeated goal",
          },
          {
            id: "tag_support_verbal",
            text: "Verbal/Indirect prompt",
          },
        ],
      },
    ],
  },
  // {
  //   id: "domain_4",
  //   order: 4,
  //   name: "Self-help",
  //   goalCount: 1,
  //   goals: [],
  // },
];

export default MOCK_DOMAINS;
