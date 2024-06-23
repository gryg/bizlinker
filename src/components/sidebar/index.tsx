import React from 'react';
import { fetchAuthenticatedUserDetails } from '@/lib/queries';
import MenuOptions from './menu-options';

type Props = {
  id: string;
  type: 'firm' | 'subsidiary';
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await fetchAuthenticatedUserDetails();

  if (!user || !user.Firm) return null;

  const isWhiteLabeledFirm = user.Firm.whiteLabel;
  const firm = user.Firm;
  const details = type === 'firm' ? firm : firm.SubSidiary.find(sub => sub.id === id);

  if (!details) return;

  let sideBarLogo = firm.firmLogo || '/assets/bizlinker-logo.svg';

  if (!isWhiteLabeledFirm && type === 'subsidiary') {
    const subsidiary = firm.SubSidiary.find(sub => sub.id === id);
    sideBarLogo = subsidiary?.subSidiaryLogo || firm.firmLogo;
  }

  const sidebarOpt = type === 'firm' ? firm.SidebarOption || [] : details.SidebarOption || [];
  
  const subsidiaries = firm.SubSidiary.filter(sub =>
    user.Permissions.some(permission => permission.subSidiaryId === sub.id && permission.access)
  );

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subSidiaries={subsidiaries}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subSidiaries={subsidiaries}
        user={user}
      />
    </>
  );
};

export default Sidebar;
