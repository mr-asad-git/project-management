const Projects = [
    {
        id: 1,
        name: "Mobile App",
        status: "completed",
        comments: 12,
        files: 10,
        tasks: [
            { id: 101, title: "Brainstorming", priority: "Low", status: "todo" },
            { id: 102, title: "Research", priority: "High", status: "todo" },
            { id: 103, title: "Wireframes", priority: "High", status: "todo" },
            { id: 104, title: "Onboarding Illustrations", priority: "Low", status: "inProgress" },
            { id: 105, title: "User Flow", priority: "High", status: "inProgress" },
            { id: 106, title: "Mobile App Design", priority: "Low", status: "completed" },
            { id: 107, title: "Design System", priority: "High", status: "completed" }
        ]
    },

    {
        id: 2,
        name: "Typescript",
        status: "completed",
        comments: 8,
        files: 5,
        tasks: [
            { id: 201, title: "Setup Typescript", priority: "High", status: "todo" },
            { id: 202, title: "Type Interfaces", priority: "High", status: "todo" },
            { id: 203, title: "Convert Components", priority: "High", status: "inProgress" },
            { id: 204, title: "Fix Type Errors", priority: "Low", status: "completed" }
        ]
    },

    {
        id: 3,
        name: "Design System",
        status: "inProgress",
        comments: 15,
        files: 12,
        tasks: [
            { id: 301, title: "Color Palette", priority: "Low", status: "todo" },
            { id: 302, title: "Typography", priority: "Low", status: "todo" },
            { id: 303, title: "Component Library", priority: "High", status: "inProgress" },
            { id: 304, title: "Button Variants", priority: "Low", status: "completed" }
        ]
    },

    {
        id: 4,
        name: "Wireframes",
        status: "onHold",
        comments: 6,
        files: 4,
        tasks: [
            { id: 401, title: "Homepage Wireframe", priority: "High", status: "todo" },
            { id: 402, title: "Dashboard Layout", priority: "Low", status: "todo" },
            { id: 403, title: "Profile Page", priority: "Low", status: "inProgress" },
            { id: 404, title: "Login Flow", priority: "High", status: "completed" }
        ]
    },

    {
        id: 5,
        name: "Web Redesign App",
        status: "todo",
        comments: 10,
        files: 7,
        tasks: [
            { id: 501, title: "Market Research", priority: "High", status: "todo" },
            { id: 502, title: "Competitor Analysis", priority: "Low", status: "todo" },
            { id: 503, title: "Landing Page Design", priority: "High", status: "inProgress" },
            { id: 504, title: "Responsive Layout", priority: "Low", status: "completed" }
        ]
    }
]

export default Projects