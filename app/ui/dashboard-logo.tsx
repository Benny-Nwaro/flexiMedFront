import { lusitana } from '@/app/ui/fonts';
import flexisaf from '@/public/flexisaf-removebg-preview.png'
import Image from 'next/image';

export default function DashboardLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none  text-white`}
    >
      <Image src={flexisaf} className="lg:h-20 lg:w-24 max-md:h-12 max-md:w-12" alt='flexisaf logo' priority/>
      <p className="lg:text-[32px] max-md:text-2xl font-bold">flexiMed</p>
    </div>
  );
}
