type Option = {
  weight: number;
  id: string;
};

export default function chooseWeightedOption(options: Option[]): string {
  const sum = options.reduce((acc, option) => acc + option.weight, 0);
  let random = Math.random() * sum;

  for (let i = 0; i < options.length; i++) {
    if (random < options[i].weight) {
      return options[i].id;
    }
    random -= options[i].weight;
  }

  // In case the input is not properly formatted and the loop doesn't return, this line ensures a fallback
  return options[options.length - 1].id;
}
