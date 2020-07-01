import taxonomyRepository from "../taxonomy/taxonomyRepository.ts";
import contentRepository from "../content/contentRepository.ts";
import mediaRepository from "../media/mediaRepository.ts";

export default {
  getRepository(bundle: string) {
    let repository: any | undefined;
    switch (bundle) {
      case "taxonomy":
        repository = taxonomyRepository;
        break;

      case "content":
        repository = contentRepository;
        break;

      case "media":
        repository = mediaRepository;
        break;
    }
    return repository;
  },
};
