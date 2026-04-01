export const COLORS = {
  primary:      "#1565C0",
  primaryDark:  "#0D47A1",
  primaryLight: "#E3F2FD",
  secondary:    "#0288D1",
  success:      "#2E7D32",
  warning:      "#E65100",
  error:        "#C62828",
  gray:         "#546E7A",
  bgPage:       "#F0F4F8",
  bgCard:       "#FFFFFF",
  border:       "#E0E7EF",
  textPrimary:  "#0F172A",
  textSecondary:"#64748B",
  textMuted:    "#94A3B8",
};

export const TAG_STYLES = {
  urgent:   { bg: "#FFEBEE", color: "#C62828", label: "URGENT"   },
  today:    { bg: "#FFF3E0", color: "#E65100", label: "TODAY"    },
  upcoming: { bg: "#FFFDE7", color: "#F57F17", label: "UPCOMING" },
  missed:   { bg: "#ECEFF1", color: "#546E7A", label: "MISSED"   },
  ok:       { bg: "#E8F5E9", color: "#2E7D32", label: "OK"       },
};

export const REMINDER_COLORS: Record<string, string> = {
  pending:   "#94A3B8",
  sent:      "#1565C0",
  purchased: "#2E7D32",
  ignored:   "#E65100",
};