import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { bentoWorkshop } from '../content/workshops/bento.js';
import { paintCakeWorkshop } from '../content/workshops/paintCake.js';
import { summerCourse } from '../content/workshops/summer.js';
import { landingPageModel } from '../server/DL/Models/landingPageModel.js';
import { fromLegacyWorkshop } from '../utils/landingPageContent.js';

const pages = [
    { slug: 'bento-workshop', title: 'סדנת בנטו', content: bentoWorkshop },
    { slug: 'paint-cake-workshop', title: 'סדנת ציור על עוגות', content: paintCakeWorkshop },
    { slug: 'summer', title: 'קורס קיץ', content: summerCourse },
];

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    } catch (error) {
        const srvRefused = error?.syscall === 'querySrv' && error?.code === 'ECONNREFUSED';
        if (!srvRefused) throw error;
        console.warn('MongoDB SRV lookup refused; retrying with public DNS');
        dns.setServers(['1.1.1.1', '8.8.8.8']);
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    }
}

async function run() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing');
    }
    await connect();
    for (const page of pages) {
        const existing = await landingPageModel.findOne({ slug: page.slug }).select('_id').lean();
        if (existing) {
            console.log(`skipped ${page.slug}`);
            continue;
        }
        await landingPageModel.create({
            title: page.title,
            template: 'workshop',
            slug: page.slug,
            previousSlugs: [],
            status: 'published',
            content: fromLegacyWorkshop(page.content),
        });
        console.log(`created ${page.slug}`);
    }
    await mongoose.disconnect();
}

run().catch((error) => {
    console.error('Landing page migration failed:', error);
    process.exit(1);
});
