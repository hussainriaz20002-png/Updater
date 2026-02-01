export type RootStackParamList = {
  GetStarted: undefined;
  SignUpScreen: undefined;
  SignUpJournalist: undefined;
  SignUpUser: undefined;
  LoginScreen: undefined;
  Main: undefined;
  DeepDive: {
    urlToImage: string;
    title: string;
    description: string;
    content?: string;
    url: string;
  };
  UploadReels: { selected: { uri: string } };
  UploadArticles: { selected: { uri: string } };
  Reels: { reels: { uri: string; caption?: string }[]; startIndex?: number };
  EditProfile: { selected: { uri: string } };
  ProfileSetting: { selected: { uri: string } };
  SavedArticles: undefined;
};
