import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  const VIDEO_URL = 'https://s3.eu-west-2.amazonaws.com/dev.ar-messages-processed/processed__005004fc13c6074d59adb39705faf36d3f3eae2ceb0e9c86ccb0166bc07c2fe8___recording_2022_03_28_19_47_38_742.mp4'
  return (
    <div className={styles.container}>
      <Head>
        <title>Beem App testbed</title>
        <meta name="description" content="Beem.me" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">WEB AR 2.0!</a>
        </h1>

        <p className={styles.description}>
          This is a tesbed for the in house js AR stuff
        </p>

        <div className={styles.grid}>
        <video
          controls
          src={VIDEO_URL}
          poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217"
          width="620">
          Sorry, your browser doesn't support embedded videos, but don't worry, you can
          <a href="https://archive.org/details/BigBuckBunny_124">download it</a>
          and watch it with your favorite video player!
        </video>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://beem.me"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by beem.me
        </a>
      </footer>
    </div>
  )
}
