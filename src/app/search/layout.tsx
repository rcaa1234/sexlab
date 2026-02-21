import { Metadata } from "next";

export const metadata: Metadata = {
  title: "搜尋文章",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
