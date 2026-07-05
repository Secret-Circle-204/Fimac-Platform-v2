const fs = require('fs');

const filesToFix = {
  'src/components/auth/role-selector.tsx': [
    ["import { Building2, Map, Shield } from 'lucide-react'", "import { Map, Shield } from 'lucide-react'"]
  ],
  'src/components/contact/contact-form.tsx': [
    ["catch (error)", "catch (_error)"]
  ],
  'src/components/features/auth/logout-button.tsx': [
    ["catch (error)", "catch (_error)"]
  ],
  'src/components/features/auth/user-nav.tsx': [
    ["import { CurrentUser } from '@/payload-types'\n", ""]
  ],
  'src/components/investor/budget-settings.tsx': [
    ["(val: any)", "(val: string)"]
  ],
  'src/components/property/property-inquiry.tsx': [
    ["import { Avatar, AvatarFallback, AvatarImage }", "import { Avatar, AvatarFallback }"],
    ["MailIcon, PhoneCallIcon, ", ""],
    ["import { Media, Property }", "import { Property }"],
    ["const property =", "// const property ="]
  ],
  'src/components/property/view-tracker.tsx': [
    ["catch (err)", "catch (_err)"]
  ],
  'src/components/search/search-results-elite.tsx': [
    ["useScroll, useTransform, ", ""]
  ],
  'src/components/search/search-results-map.tsx': [
    ["ChevronRight, ", ""],
    ["(p.location as any)", "(p.location as { latitude: number; longitude: number })"],
    ["const data: any[] =", "const data: unknown[] ="],
    ["setHoveredProperty(d)", "// setHoveredProperty(d)"],
    ["const [hoveredProperty, setHoveredProperty] = useState<any | null>(null)", "const [hoveredProperty, setHoveredProperty] = useState<unknown | null>(null)"],
    ["const [activePortalProperty, setActivePortalProperty] = useState<any | null>(null)", "const [activePortalProperty, setActivePortalProperty] = useState<unknown | null>(null)"],
    ["const globeRef = useRef<any>(null)", "const globeRef = useRef<unknown>(null)"],
    ["htmlElement={(d: any)", "htmlElement={(d: Record<string, unknown>)"],
    ["const lightsToRemove: any[] = []", "const lightsToRemove: unknown[] = []"],
    ["scene.traverse((child: any)", "scene.traverse((child: Record<string, any>)"]
  ],
  'src/components/shared/layout/site-header/index.tsx': [
    ["const company_name =", "const _company_name ="]
  ],
  'src/components/ui/command.tsx': [
    ["showCloseButton = false,", ""]
  ],
  'src/featured-properties/featured-properties-client.tsx': [
    ["import Image from \"next/image\"", ""],
    ["import Link from \"next/link\"", ""],
    ["(direction: number)", "(_direction: number)"],
    [", [])", ", [triggerShaderTransition])"]
  ],
  'src/featured-properties/hooks/use-gesture-control.ts': [
    ["(state: any)", "(state: { active: boolean; movement: [number, number]; velocity: [number, number] })"],
    ["@ts-ignore", "@ts-expect-error"]
  ],
  'src/featured-properties/hooks/use-sound-effects.ts': [
    ["volume?: any", "volume?: number"],
    ["const dur =", "const _dur ="]
  ],
  'src/featured-properties/hooks/use-voice-narrator.ts': [
    [", [])", ", [speakFallback, stop])"]
  ],
  'src/lib/api/response.ts': [
    ["(data: any", "(data: unknown"]
  ],
  'src/lib/auth/get-current-user.ts': [
    ["catch (error)", "catch (_error)"],
    ["const decoded: any =", "const decoded: unknown ="],
    ["(header: any)", "(header: unknown)"]
  ],
  'src/lib/email/nodemailer.ts': [
    ["(email: string)", "(_email: string)"]
  ],
  'src/lib/security/csrf.ts': [
    ["const CSRF_TOKEN_NAME =", "const _CSRF_TOKEN_NAME ="]
  ]
};

for (const [file, replacements] of Object.entries(filesToFix)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [target, replacement] of replacements) {
      if (content.includes(target)) {
        content = content.replace(target, replacement);
        console.log(`Replaced in ${file}: ${target} -> ${replacement}`);
      } else {
        console.log(`NOT FOUND in ${file}: ${target}`);
      }
    }
    fs.writeFileSync(file, content, 'utf8');
  } else {
    console.log('File not found:', file);
  }
}
