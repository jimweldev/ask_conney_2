import { useState, type ReactNode } from 'react';
import MainTemplateHeader from './_components/main-template-header/main-template-header';
import MainTemplateSidebar, {
  type SidebarGroup,
} from './_components/main-template-sidebar';

type MainTemplateProps = {
  sidebarGroups: SidebarGroup[];
  children: ReactNode;
};

const MainTemplate = ({ sidebarGroups, children }: MainTemplateProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden wrap-anywhere">
      <MainTemplateSidebar open={open} sidebarGroups={sidebarGroups} />

      <section className="flex min-w-screen flex-1 flex-col overflow-y-scroll sm:min-w-0">
        <MainTemplateHeader open={open} setOpen={setOpen} />

        <main className="p-layout @container/main flex-1 sm:p-6">
          {children}
        </main>
      </section>
    </div>
  );
};

export default MainTemplate;
