import type { VideoData } from "./types"

// Generate mock data for when API calls fail or for development
export const generateMockVideos = (count = 12): VideoData[] => {
  const videos: VideoData[] = []

  const titles = [
    "How to Build a Modern Website in 2023",
    "10 JavaScript Tips You Need to Know",
    "React vs Vue vs Angular - Which One Should You Choose?",
    "Building a Full-Stack App with Next.js and Supabase",
    "The Future of Web Development",
    "Learn TypeScript in 60 Minutes",
    "CSS Grid Layout Tutorial",
    "How to Deploy Your App to Vercel",
    "Building Responsive UIs with Tailwind CSS",
    "State Management in React: Context API vs Redux",
    "Creating Animations with Framer Motion",
    "Web Performance Optimization Techniques",
    "Building a REST API with Node.js",
    "Introduction to GraphQL",
    "Authentication Best Practices for Web Apps",
    "Serverless Functions Explained",
  ]

  const channelNames = [
    "CodeMaster",
    "WebDev Simplified",
    "JavaScript Guru",
    "React Tutorials",
    "Programming with Mosh",
    "The Net Ninja",
    "Traversy Media",
    "Dev Ed",
    "Fireship",
    "Academind",
  ]

  const durations = [
    "5:42",
    "10:15",
    "15:30",
    "8:22",
    "22:45",
    "7:18",
    "12:33",
    "18:05",
    "6:47",
    "25:10",
    "14:23",
    "9:56",
  ]

  for (let i = 0; i < count; i++) {
    const id = `mock${i + 1}`
    const titleIndex = Math.floor(Math.random() * titles.length)
    const channelIndex = Math.floor(Math.random() * channelNames.length)
    const durationIndex = Math.floor(Math.random() * durations.length)

    const publishedDate = new Date()
    publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 365))

    videos.push({
      id,
      title: titles[titleIndex],
      description:
        "This is a mock video description. In a real application, this would contain detailed information about the video content.",
      thumbnail: `/placeholder.svg?height=720&width=1280&text=${encodeURIComponent(titles[titleIndex])}`,
      duration: durations[durationIndex],
      views: Math.floor(Math.random() * 1000000) + 1000,
      likes: Math.floor(Math.random() * 50000) + 100,
      publishedAt: publishedDate.toISOString(),
      channelName: channelNames[channelIndex],
      channelAvatar: `/api/channel-avatar/${channelNames[channelIndex].replace(/\s+/g, "")}`,
      subscribers: Math.floor(Math.random() * 1000000) + 1000,
    })
  }

  return videos
}

// Generate a single mock video with a specific ID
export const generateMockVideo = (id: string): VideoData => {
  const titles = [
    "How to Build a Modern Website in 2023",
    "10 JavaScript Tips You Need to Know",
    "React vs Vue vs Angular - Which One Should You Choose?",
  ]

  const title = titles[Math.floor(Math.random() * titles.length)]
  const channelName = "CodeMaster"
  const publishedDate = new Date()
  publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 30))

  return {
    id,
    title,
    description:
      "This is a mock video description. In a real application, this would contain detailed information about the video content.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    thumbnail: `/placeholder.svg?height=720&width=1280&text=${encodeURIComponent(title)}`,
    duration: "10:15",
    views: Math.floor(Math.random() * 1000000) + 1000,
    likes: Math.floor(Math.random() * 50000) + 100,
    publishedAt: publishedDate.toISOString(),
    channelName,
    channelAvatar: `/api/channel-avatar/${channelName.replace(/\s+/g, "")}`,
    subscribers: Math.floor(Math.random() * 1000000) + 1000,
  }
}
