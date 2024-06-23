'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Firm, FirmSidebarOption, SubSidiary, SubSidiarySidebarOption } from '@prisma/client';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from 'lucide-react';
import clsx from 'clsx';
import { AspectRatio } from '../ui/aspect-ratio';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useModal } from '@/providers/modal-provider';
import CustomModal from '../global/custom-modal';
import SubSidiaryDetails from '../forms/subsidiary-details';
import { Separator } from '../ui/separator';
import { icons } from '@/lib/constants';

type Props = {
  defaultOpen?: boolean;
  subSidiaries: SubSidiary[];
  sidebarOpt: FirmSidebarOption[] | SubSidiarySidebarOption[];
  sidebarLogo: string;
  details: any;
  user: any;
  id: string;
};

const MenuOptions = ({
  details,
  id,
  sidebarLogo,
  sidebarOpt,
  subSidiaries,
  user,
  defaultOpen,
}: Props) => {
  const { setOpen } = useModal();
  const [isMounted, setIsMounted] = useState(false);

  const openState = useMemo(() => ({ open: defaultOpen || false }), [defaultOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger asChild className="absolute left-4 top-4 z-[100] md:!hidden flex">
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        showX={!defaultOpen}
        side="left"
        className={clsx(
          'bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6',
          {
            'hidden md:inline-block z-0 w-[300px]': defaultOpen,
            'inline-block md:hidden z-[100] w-full': !defaultOpen,
          }
        )}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full my-4 flex items-center justify-between py-8"
                variant="ghost"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">{details.address}</span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Search accounts..." />
                <CommandList className="pb-16">
                  <CommandEmpty>No results found</CommandEmpty>
                  {(user?.role === 'FIRM_OWNER' || user?.role === 'FIRM_ADMIN') && user?.Firm && (
                    <CommandGroup heading="Firm">
                      <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                        {defaultOpen ? (
                          <Link href={`/firm/${user?.Firm?.id}`} className="flex gap-4 w-full h-full">
                            <div className="relative w-16">
                              <Image
                                src={user?.Firm?.firmLogo}
                                alt="Firm Logo"
                                fill
                                className="rounded-md object-contain"
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              {user?.Firm?.name}
                              <span className="text-muted-foreground">{user?.Firm?.address}</span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link href={`/firm/${user?.Firm?.id}`} className="flex gap-4 w-full h-full">
                              <div className="relative w-16">
                                <Image
                                  src={user?.Firm?.firmLogo}
                                  alt="Firm Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {user?.Firm?.name}
                                <span className="text-muted-foreground">{user?.Firm?.address}</span>
                              </div>
                            </Link>
                          </SheetClose>
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Accounts">
                    {subSidiaries?.length > 0 ? (
                      subSidiaries.map((subsidiary) => (
                        <CommandItem key={subsidiary.id}>
                          {defaultOpen ? (
                            <Link href={`/subsidiary/${subsidiary.id}`} className="flex gap-4 w-full h-full">
                              <div className="relative w-16">
                                <Image
                                  src={subsidiary.subSidiaryLogo}
                                  alt="Logo SubSidiary"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {subsidiary.name}
                                <span className="text-muted-foreground">{subsidiary.address}</span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link href={`/subsidiary/${subsidiary.id}`} className="flex gap-4 w-full h-full">
                                <div className="relative w-16">
                                  <Image
                                    src={subsidiary.subSidiaryLogo}
                                    alt="Logo SubSidiary"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {subsidiary.name}
                                  <span className="text-muted-foreground">{subsidiary.address}</span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))
                    ) : (
                      'There are no accounts'
                    )}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'FIRM_OWNER' || user?.role === 'FIRM_ADMIN') && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2"
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Create a subsidiary"
                            subheading="You can change between the firm and subsidiary from the sidebar."
                          >
                            <SubSidiaryDetails
                              firmDetails={user?.Firm as Firm}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>
                        );
                      }}
                    >
                      <PlusCircleIcon size={15} />
                      Create a new account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2">Menu Links</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Search..." />
              <CommandList className="py-4 overflow-visible">
                <CommandEmpty>No results</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {sidebarOpt.map((sidebarOptions) => {
                    let iconComponent = null;
                    const icon = icons.find((icon) => icon.value === sidebarOptions.icon);
                    if (icon) {
                      iconComponent = <icon.path />;
                    }
                    return (
                      <CommandItem key={sidebarOptions.id} className="md:w-[320px] w-full">
                        <Link
                          href={sidebarOptions.link}
                          className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all md:w-full w-[320px]"
                        >
                          {iconComponent}
                          <span>{sidebarOptions.name}</span>
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;



