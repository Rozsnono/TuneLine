import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.yourname.hitstermobile',
    appName: 'Hitster Mobile',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    }
};

export default config;