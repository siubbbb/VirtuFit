# **App Name**: VirtuFit

## Core Features:

- User Authentication: Secure sign-up and login using Firebase Auth with email/Google login. Users can manage their profile and account settings.
- Privacy Management: Users can delete their data, ensuring privacy.  All body measurement data is encrypted and stored securely in Firebase Firestore.
- Camera Capture Flow: Guided camera capture flow via QR code that guides the user in capturing front and side photos using their iPhone. Choozr's red/green zones provide user feedback during photo capture.
- Body Measurement Extraction: Integrate Hugging Face models (Mediapipe Pose, OpenPose, AnthropometryNet) via Firebase Functions for body keypoint detection and anthropometric measurement.  Apply geometric correction to normalize tilted captures.
- 2D Avatar Generation: Generate and store a front-facing 2D avatar matching the user’s body shape using human parsing/segmentation (DeepLabV3, Mask R-CNN). The avatar is stored securely in Firestore and linked to the user profile.
- Virtual Try-On: Integrate VITON-HD or ClothFlow via Hugging Face Inference API to enable virtual try-on of garments. Garments are resized based on brand size chart data, conditioned on size metadata, allowing users to toggle between sizes (S, M, L, XL). We will be using UNIQLO shirts to test/train the AI.
- Fit Recommendation Engine: Cross-reference user measurements with brand size charts to output a "best-fit score" for each garment size. Display alongside virtual try-on for context.

## Style Guidelines:

- Primary color: Vibrant Teal (#00A36C) to evoke a sense of health, technology, and approachability.
- Secondary color: Warm Coral (#FF7F50) as an accent to highlight interactive elements and calls to action, providing a friendly and energetic feel.
- Background color: Light Lavender (#E6E6FA) to offer a soft, modern backdrop that’s easy on the eyes and complements the primary and secondary colors.
- Body and headline font: 'Rubik', a sans-serif font, for a modern, friendly, and readable interface.
- Use clean, outlined icons with rounded edges to maintain a friendly and approachable aesthetic. Icons should be intuitive and consistent throughout the app.
- Employ a balanced layout that prioritizes the avatar and garment display. Use whitespace effectively to avoid clutter and create a sense of openness.
- Incorporate subtle, smooth animations for transitions and feedback to enhance the user experience, such as gentle fades between garment sizes and satisfying visual cues during interactions.