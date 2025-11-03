import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all page components
const Home = lazy(() => import("@/components/pages/Home"));
const Events = lazy(() => import("@/components/pages/Events"));
const EventDetails = lazy(() => import("@/components/pages/EventDetails"));
const About = lazy(() => import("@/components/pages/About"));
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const MyEvents = lazy(() => import("@/components/pages/MyEvents"));
const CreateEvent = lazy(() => import("@/components/pages/CreateEvent"));
const EditEvent = lazy(() => import("@/components/pages/EditEvent"));
const Profile = lazy(() => import("@/components/pages/Profile"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>
);

// Wrap components with Suspense
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

// Main routes configuration
const mainRoutes = [
  {
    path: "",
    index: true,
    element: <SuspenseWrapper><Home /></SuspenseWrapper>
  },
  {
    path: "events",
    element: <SuspenseWrapper><Events /></SuspenseWrapper>
  },
  {
    path: "events/:id",
    element: <SuspenseWrapper><EventDetails /></SuspenseWrapper>
  },
  {
    path: "about",
    element: <SuspenseWrapper><About /></SuspenseWrapper>
  },
  {
    path: "login",
    element: <SuspenseWrapper><Login /></SuspenseWrapper>
  },
  {
    path: "signup",
    element: <SuspenseWrapper><Signup /></SuspenseWrapper>
  },
  {
    path: "dashboard",
    element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>
  },
  {
    path: "my-events",
    element: <SuspenseWrapper><MyEvents /></SuspenseWrapper>
  },
  {
    path: "create-event",
    element: <SuspenseWrapper><CreateEvent /></SuspenseWrapper>
  },
  {
    path: "edit-event/:id",
    element: <SuspenseWrapper><EditEvent /></SuspenseWrapper>
  },
  {
    path: "profile",
    element: <SuspenseWrapper><Profile /></SuspenseWrapper>
  },
  {
    path: "callback",
    element: <SuspenseWrapper><Callback /></SuspenseWrapper>
  },
  {
    path: "error",
    element: <SuspenseWrapper><ErrorPage /></SuspenseWrapper>
  },
  {
    path: "prompt-password/:appId/:emailAddress/:provider",
    element: <SuspenseWrapper><PromptPassword /></SuspenseWrapper>
  },
  {
    path: "reset-password/:appId/:fields",
    element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>
  },
  {
    path: "*",
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>
  }
];

// Routes array with Layout wrapper
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);