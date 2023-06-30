namespace DocuSign.MyAPI.Services
{
    public class RandomGenerator : IRandomGenerator
    {
        private Random _random;

        public RandomGenerator()
        {
            _random = new Random();
        }

        public int Generate()
        {
            return _random.Next(1, 1000);
        }
    }
}
