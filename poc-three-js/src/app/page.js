// page.js or your specific page file
import dynamic from 'next/dynamic';

const ThreeCanvasNoSSR = dynamic(() => import('../components/ThreeCanvas'), {
  ssr: false,
});

export default function Page() {
  return <ThreeCanvasNoSSR />;
}
