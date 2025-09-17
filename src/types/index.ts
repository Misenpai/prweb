export interface Photo {
  url: string;
  type?: string;
}

export interface Audio {
  url: string;
  duration?: number;
}

export interface Attendance {
  date: string;
  checkinTime: string;
  checkoutTime?: string;
  sessionType?: "FN" | "AF";
  attendanceType?: "FULL_DAY" | "HALF_DAY";
  locationType?: "CAMPUS" | "FIELDTRIP";
  takenLocation?: string;

  photo?: {
    url: string;
  } | null;
  audio?: {
    url: string;
    duration?: number;
  } | null;

  location?: {
    takenLocation?: string;
    latitude?: number | null;
    longitude?: number | null;
    county?: string | null;
    state?: string | null;
    postcode?: string | null;
    address?: string | null;
  };

  isCheckedOut?: boolean;
  isFullDay?: boolean;
  isHalfDay?: boolean;

  username?: string;
}

export interface User {
  employeeNumber: string;
  username: string;
  empClass: string;
  dateOfResign?: string;
  projects: {
    projectCode: string;
    department: string;
  }[];
  hasActiveFieldTrip: boolean;
  monthlyStatistics: {
    totalDays: number;
    fullDays: number;
    halfDays: number;
    notCheckedOut: number;
  };
  attendances: Attendance[];
}

export interface FieldTrip {
  startDate: string;
  endDate: string;
  description?: string;
}

export interface PIUser {
  principalInvestigatorKey: string;
  username: string;
  projectCode: string;
  projects?: string[];
}

export interface ApiResponse {
  success: boolean;
  month: number;
  year: number;
  totalUsers: number;
  data: User[];
}

export interface Holiday {
  date: string;
  description: string;
  isWeekend: boolean;
  dayOfWeek: string;
  month: string;
}

export interface CalendarAttendance {
  present: boolean;
  type: "FULL_DAY" | "HALF_DAY" | "IN_PROGRESS" | "ABSENT";
  username: string;
}

export interface CalendarDay {
  date: string;
  isHoliday: boolean;
  isWeekend: boolean;
  description?: string;
  attendances: {
    [employeeNumber: string]: CalendarAttendance;
  };
}

export interface AuthUser {
  username: string;
  projectCode: string;
  projects: string[];
  token: string;
  isSSO?: boolean;
}

export type DebugInfo = {
  ssoData?: {
    username: string;
    projectCodes: string[];
    timestamp: number;
  };
  authUser?: {
    username: string;
    projectCode: string;
    projects: string[];
    token: string;
    isSSO: boolean;
  };
  tokenAge?: number;
  error?: unknown;
  token?: string | null;
};

export interface UserAttendance extends Attendance {
  username: string;
}
