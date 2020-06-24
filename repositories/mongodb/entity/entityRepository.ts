import taxonomyRepository from "../taxonomy/taxonomyRepository.ts";
import contentRepository from "../content/contentRepository.ts";

export default {
  getRepository(entity: string) {
    let repository: any | undefined;
    switch (entity) {
      case "taxonomy":
        repository = taxonomyRepository;
        break;

      case "content":
        repository = contentRepository;
        break;
    }
    return repository;
  },
};
