export interface TrackTask {
    id: string;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    estimatedHours: number;
    resources?: string[];
    deliverables: string[];
}

export interface TrackTaskGroup {
    trackTitle: string;
    trackId: string;
    tasks: TrackTask[];
}

export const trackTasksMap: Record<string, TrackTask[]> = {
    "Frontend Development": [
        {
            id: "fe-1",
            title: "Personal Portfolio Website",
            description:
                "Build a responsive personal portfolio website using HTML, CSS, and JavaScript. It should include an about section, project showcase, skills section, and a contact form.",
            difficulty: "Beginner",
            estimatedHours: 12,
            resources: [
                "https://developer.mozilla.org/en-US/docs/Learn",
                "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
            ],
            deliverables: [
                "GitHub repository with source code",
                "Live deployed link (GitHub Pages, Netlify, or Vercel)",
                "LinkedIn post showcasing the project",
            ],
        },
        {
            id: "fe-2",
            title: "React To-Do Application",
            description:
                "Create a fully functional to-do application using React.js with features like add, edit, delete, mark complete, and filter tasks. Use local storage for persistence.",
            difficulty: "Intermediate",
            estimatedHours: 16,
            resources: [
                "https://react.dev/learn",
                "https://www.freecodecamp.org/news/react-tutorial-build-a-project/",
            ],
            deliverables: [
                "GitHub repository with clean code and README",
                "Deployed application link",
                "LinkedIn post about the learning experience",
            ],
        },
        {
            id: "fe-3",
            title: "Dashboard UI Clone",
            description:
                "Recreate a modern admin dashboard UI (e.g., analytics dashboard) using React and TailwindCSS. Include charts, tables, sidebar navigation, and responsive design.",
            difficulty: "Advanced",
            estimatedHours: 24,
            resources: [
                "https://tailwindcss.com/docs",
                "https://recharts.org/en-US/",
            ],
            deliverables: [
                "GitHub repository with well-structured components",
                "Live demo link",
                "LinkedIn post with screenshots/video demo",
            ],
        },
    ],

    "Backend Development": [
        {
            id: "be-1",
            title: "RESTful API with Node.js",
            description:
                "Build a RESTful API for a simple CRUD application (e.g., a blog or bookstore) using Node.js and Express. Include input validation, error handling, and proper HTTP status codes.",
            difficulty: "Beginner",
            estimatedHours: 14,
            resources: [
                "https://expressjs.com/en/guide/routing.html",
                "https://nodejs.org/en/docs/guides",
            ],
            deliverables: [
                "GitHub repository with README and API documentation",
                "Postman collection or API docs",
                "LinkedIn post about the project",
            ],
        },
        {
            id: "be-2",
            title: "Authentication System",
            description:
                "Implement a user authentication system with registration, login, JWT token-based auth, password hashing, and role-based access control.",
            difficulty: "Intermediate",
            estimatedHours: 18,
            resources: [
                "https://jwt.io/introduction",
                "https://www.npmjs.com/package/bcrypt",
            ],
            deliverables: [
                "GitHub repository with secure implementation",
                "API documentation with auth endpoints",
                "LinkedIn post detailing security considerations",
            ],
        },
        {
            id: "be-3",
            title: "Database Design & Optimization",
            description:
                "Design a normalized database schema for an e-commerce platform. Implement it with PostgreSQL, write efficient queries, and add indexing for performance.",
            difficulty: "Advanced",
            estimatedHours: 20,
            resources: [
                "https://www.postgresql.org/docs/current/tutorial.html",
                "https://use-the-index-luke.com/",
            ],
            deliverables: [
                "GitHub repository with schema, migrations, and seed data",
                "Performance benchmarks documentation",
                "LinkedIn post about database design decisions",
            ],
        },
    ],

    "Full Stack Development": [
        {
            id: "fs-1",
            title: "Full Stack Blog Platform",
            description:
                "Build a complete blog platform with user registration, post creation/editing, comments, and a modern responsive UI. Use React for frontend and Node.js/Express for backend.",
            difficulty: "Intermediate",
            estimatedHours: 30,
            resources: [
                "https://react.dev/learn",
                "https://expressjs.com/",
            ],
            deliverables: [
                "GitHub repository (monorepo or separate repos)",
                "Deployed application (frontend + backend)",
                "LinkedIn post showcasing the project",
            ],
        },
        {
            id: "fs-2",
            title: "Real-time Chat Application",
            description:
                "Create a real-time chat application with user authentication, private/group messaging, online status indicators, and message history using WebSockets.",
            difficulty: "Advanced",
            estimatedHours: 35,
            resources: [
                "https://socket.io/docs/v4/",
                "https://www.mongodb.com/docs/",
            ],
            deliverables: [
                "GitHub repository with clean architecture",
                "Live demo link",
                "LinkedIn post with video demo",
            ],
        },
    ],

    "Mobile App Development": [
        {
            id: "mob-1",
            title: "Weather App",
            description:
                "Build a mobile weather application that fetches real-time data from a weather API. Include location-based weather, 5-day forecast, and beautiful UI with weather animations.",
            difficulty: "Beginner",
            estimatedHours: 14,
            resources: [
                "https://openweathermap.org/api",
                "https://flutter.dev/docs",
            ],
            deliverables: [
                "GitHub repository with source code",
                "APK or app demo video",
                "LinkedIn post about the project",
            ],
        },
        {
            id: "mob-2",
            title: "Task Manager Mobile App",
            description:
                "Create a cross-platform task management app with categories, due dates, reminders, priority levels, and local/cloud data persistence.",
            difficulty: "Intermediate",
            estimatedHours: 22,
            resources: [
                "https://flutter.dev/docs/cookbook",
                "https://firebase.google.com/docs",
            ],
            deliverables: [
                "GitHub repository with clean architecture",
                "App demo video or APK",
                "LinkedIn post showcasing features",
            ],
        },
    ],

    "Cybersecurity": [
        {
            id: "cs-1",
            title: "Vulnerability Assessment Report",
            description:
                "Conduct a vulnerability assessment on a provided test environment. Identify common vulnerabilities (OWASP Top 10), document findings, and propose remediation strategies.",
            difficulty: "Intermediate",
            estimatedHours: 18,
            resources: [
                "https://owasp.org/www-project-top-ten/",
                "https://portswigger.net/web-security",
            ],
            deliverables: [
                "Detailed vulnerability report (PDF)",
                "Remediation guide with code examples",
                "LinkedIn post about cybersecurity learnings",
            ],
        },
        {
            id: "cs-2",
            title: "Secure Web Application",
            description:
                "Build a web application that demonstrates secure coding practices including input sanitization, CSRF protection, secure headers, and encryption at rest and in transit.",
            difficulty: "Advanced",
            estimatedHours: 25,
            resources: [
                "https://cheatsheetseries.owasp.org/",
                "https://developer.mozilla.org/en-US/docs/Web/Security",
            ],
            deliverables: [
                "GitHub repository with security-focused code",
                "Security audit documentation",
                "LinkedIn post detailing security measures",
            ],
        },
    ],

    "UI/UX Design": [
        {
            id: "ux-1",
            title: "Mobile App Redesign",
            description:
                "Choose an existing mobile app and redesign its UI/UX. Create user personas, journey maps, wireframes, and high-fidelity mockups for at least 5 screens.",
            difficulty: "Beginner",
            estimatedHours: 16,
            resources: [
                "https://www.figma.com/resources/learn-design/",
                "https://lawsofux.com/",
            ],
            deliverables: [
                "Figma file with all designs",
                "Case study document (PDF or Notion link)",
                "LinkedIn post presenting the redesign",
            ],
        },
        {
            id: "ux-2",
            title: "Design System Creation",
            description:
                "Create a comprehensive design system including color palette, typography, iconography, spacing system, component library (buttons, inputs, cards, modals), and documentation.",
            difficulty: "Advanced",
            estimatedHours: 28,
            resources: [
                "https://designsystemchecklist.com/",
                "https://www.designsystems.com/",
            ],
            deliverables: [
                "Figma component library",
                "Design system documentation",
                "LinkedIn post about the design process",
            ],
        },
    ],

    "Data Science & AI": [
        {
            id: "ds-1",
            title: "Exploratory Data Analysis Project",
            description:
                "Perform EDA on a real-world dataset (e.g., from Kaggle). Clean the data, create visualizations, identify patterns, and present insights with a Jupyter Notebook.",
            difficulty: "Beginner",
            estimatedHours: 14,
            resources: [
                "https://www.kaggle.com/datasets",
                "https://pandas.pydata.org/docs/",
            ],
            deliverables: [
                "GitHub repository with Jupyter Notebook",
                "Data visualization report",
                "LinkedIn post with key insights",
            ],
        },
        {
            id: "ds-2",
            title: "Machine Learning Classification Model",
            description:
                "Build and evaluate a classification model for a real-world problem. Compare at least 3 algorithms, perform feature engineering, hyperparameter tuning, and model evaluation.",
            difficulty: "Intermediate",
            estimatedHours: 22,
            resources: [
                "https://scikit-learn.org/stable/tutorial/",
                "https://www.tensorflow.org/tutorials",
            ],
            deliverables: [
                "GitHub repository with clean, documented code",
                "Model performance comparison report",
                "LinkedIn post about the ML journey",
            ],
        },
    ],

    "DevOps & Cloud": [
        {
            id: "do-1",
            title: "CI/CD Pipeline Setup",
            description:
                "Set up a complete CI/CD pipeline using GitHub Actions for a sample application. Include automated testing, building, linting, and deployment to a cloud platform.",
            difficulty: "Intermediate",
            estimatedHours: 16,
            resources: [
                "https://docs.github.com/en/actions",
                "https://docs.docker.com/get-started/",
            ],
            deliverables: [
                "GitHub repository with CI/CD configuration",
                "Pipeline documentation with screenshots",
                "LinkedIn post about DevOps practices",
            ],
        },
        {
            id: "do-2",
            title: "Containerized Microservices",
            description:
                "Containerize a multi-service application using Docker and Docker Compose. Include a frontend, backend, database, and reverse proxy with proper networking.",
            difficulty: "Advanced",
            estimatedHours: 24,
            resources: [
                "https://docs.docker.com/compose/",
                "https://kubernetes.io/docs/tutorials/",
            ],
            deliverables: [
                "GitHub repository with Dockerfiles and compose config",
                "Architecture documentation",
                "LinkedIn post about containerization challenges",
            ],
        },
    ],

    "Game Development": [
        {
            id: "gd-1",
            title: "2D Platformer Game",
            description:
                "Create a 2D platformer game with player movement, obstacle avoidance, collectibles, scoring, and at least 3 levels using Unity or a similar game engine.",
            difficulty: "Intermediate",
            estimatedHours: 28,
            resources: [
                "https://learn.unity.com/",
                "https://docs.godotengine.org/",
            ],
            deliverables: [
                "GitHub repository with source code",
                "Playable build (WebGL or executable)",
                "LinkedIn post with gameplay video",
            ],
        },
        {
            id: "gd-2",
            title: "Game Design Document",
            description:
                "Write a comprehensive Game Design Document (GDD) for an original game concept. Include game mechanics, story, art direction, level design, and technical specifications.",
            difficulty: "Beginner",
            estimatedHours: 12,
            resources: [
                "https://www.gamedeveloper.com/",
            ],
            deliverables: [
                "Complete GDD document (PDF or Google Docs)",
                "Concept art or wireframes",
                "LinkedIn post about the game concept",
            ],
        },
    ],

    "Embedded Systems": [
        {
            id: "em-1",
            title: "IoT Sensor Dashboard",
            description:
                "Build an IoT project using Arduino or ESP32 that reads sensor data (temperature, humidity, etc.) and displays it on a web dashboard in real-time.",
            difficulty: "Intermediate",
            estimatedHours: 20,
            resources: [
                "https://www.arduino.cc/en/Guide",
                "https://randomnerdtutorials.com/",
            ],
            deliverables: [
                "GitHub repository with firmware and dashboard code",
                "Circuit diagram and hardware documentation",
                "LinkedIn post with project demo video",
            ],
        },
        {
            id: "em-2",
            title: "Embedded System Design Report",
            description:
                "Design and document an embedded system solution for a real-world problem. Include hardware selection, firmware architecture, power considerations, and protocol choices.",
            difficulty: "Advanced",
            estimatedHours: 18,
            resources: [
                "https://www.embedded.com/",
            ],
            deliverables: [
                "Technical design document (PDF)",
                "Simulation or prototype code",
                "LinkedIn post about the design process",
            ],
        },
    ],
};

/**
 * Get tasks for a specific internship track.
 * Returns an empty array if the track is not found.
 */
export const getTasksForTrack = (trackTitle: string): TrackTask[] => {
    return trackTasksMap[trackTitle] ?? [];
};
