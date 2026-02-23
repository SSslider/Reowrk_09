import { LucideIcon } from "lucide-react";

export interface Project {
  id: string;
  client: string;
  year: string;
  title: string;
  image: string;
  tags: string[];
  theme: 'light' | 'dark';
}

export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  tags: string[];
}

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  source: 'Upwork' | 'Clutch' | 'LinkedIn';
}

export interface NavItem {
  label: string;
  href: string;
}