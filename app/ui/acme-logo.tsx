import { lusitana } from '@/app/ui/fonts';
import flexisaf from '@/public/flexisaf-removebg-preview.png'
import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none -mt-12 text-white`}
    >
      <Image src={flexisaf} className="lg:h-32 lg:w-32 max-md:h-20 max-md:w-20" alt='flexisaf logo' priority/>
      <p className="lg:text-[52px] max-md:text-2xl font-bold">flexiMed</p>
    </div>
  );
}
