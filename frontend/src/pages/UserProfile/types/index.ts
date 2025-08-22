export interface ProfileData {
    email: string;
    first_name: string;
    last_name: string;
    organization: string;
    faculty_and_major: string;
    bio: string;
    gender: string;
    language: string;
    phone?: string;  // optional
    profile_picture?: string;  // optional
    positions?: string;  // optional
  }
  
  export interface Message {
    type: 'success' | 'error' | '';
    content: string;
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    userprofile?: {
      organization?: string;
      faculty_and_major?: string;
      bio?: string;
      gender?: string;
      language?: string;
      phone?: string;
      profile_picture?: string;
      positions?: string;
      avatar?: string;
    };
  }
  