type NamingType =
  | 'PascalPlural'
  | 'PascalSingular'
  | 'KebabPlural'
  | 'KebabSingular'
  | 'CamelPlural'
  | 'CamelSingular'
  | 'Readable'
  | 'ReadablePlural'
  | 'ReadableSingular';

const convertNaming = (input: string, type: NamingType): string => {
  const words: string[] = input.toLowerCase().split('_');

  // smart singular converter
  const toSingular = (word: string): string => {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y'; // categories -> category
    if (word.endsWith('s')) return word.slice(0, -1); // tickets -> ticket
    return word;
  };

  const pluralWords: string[] = words;
  const singularWords: string[] = [...words];

  singularWords[singularWords.length - 1] = toSingular(
    singularWords[singularWords.length - 1],
  );

  const pascal = (arr: string[]): string =>
    arr.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

  const camel = (arr: string[]): string =>
    arr[0] +
    arr
      .slice(1)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

  const readable = (arr: string[]): string =>
    arr.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  switch (type) {
    case 'PascalPlural': // job_requisitions -> JobRequisitions
      return pascal(pluralWords);

    case 'PascalSingular': // job_requisitions -> JobRequisition
      return pascal(singularWords);

    case 'KebabPlural': // job_requisitions -> job-requisitions
      return pluralWords.join('-');

    case 'KebabSingular': // job_requisitions -> job-requisition
      return singularWords.join('-');

    case 'CamelPlural': // job_requisitions -> jobRequisitions
      return camel(pluralWords);

    case 'CamelSingular': // job_requisitions -> jobRequisition
      return camel(singularWords);

    case 'Readable':
      // Default: return plural readable if input looks plural, else singular
      return input.endsWith('s')
        ? readable(pluralWords)
        : readable(singularWords);

    case 'ReadablePlural': // job_requisitions -> Job Requisitions
      return pluralWords
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    case 'ReadableSingular': // job_requisitions -> Job Requisition
      return singularWords
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    default:
      return input;
  }
};

export default convertNaming;
