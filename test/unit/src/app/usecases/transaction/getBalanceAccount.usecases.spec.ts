import { GetBalanceAccountUsecases } from 'src/app/usecases/transaction/getBalanceAccount.usecases';
import { IException } from 'src/domain/protocols/exceptions/exceptions.interface';
import { IAccountRepository } from 'src/domain/protocols/repositories/account.repository.interface';
import { accountMock } from 'test/unit/mocks/account.mock';
import { makeExceptionMock } from 'test/unit/mocks/factory.mock';

interface SutTypes {
  sut: GetBalanceAccountUsecases;
  makeAccountRepository: IAccountRepository;
  makeException: IException;
}

const makeSut = (): SutTypes => {
  const makeAccountRepository: IAccountRepository = {
    create: jest.fn().mockReturnValue(accountMock),
    findAll: jest.fn(),
    deleteById: jest.fn(),
    findById: jest.fn().mockReturnValue({ ...accountMock, id: 1 }),
    update: jest.fn(),
    findByDocument: jest.fn().mockReturnValue(null)
  };

  const makeException = makeExceptionMock;
  const sut = new GetBalanceAccountUsecases(
    makeAccountRepository,
    makeException
  );
  return { sut, makeAccountRepository, makeException };
};
describe('app :: usecases :: transaction :: GetBalanceAccountUsecases', () => {
  it('should call AccountRepository with correct values', async () => {
    const { sut, makeAccountRepository } = makeSut();

    await sut.execute(1);

    expect(makeAccountRepository.findById).toHaveBeenCalledWith(1);
  });
  it('should return correct values', async () => {
    const { sut } = makeSut();

    const response = await sut.execute(1);

    expect(response).toEqual({
      balance: 20,
      id: 1,
      message: 'John Doe you have R$20 in your account',
      name: 'John Doe'
    });
  });
  it('should throw if account not found', async () => {
    const { sut, makeAccountRepository, makeException } = makeSut();
    jest
      .spyOn(makeAccountRepository, 'findById')
      .mockReturnValueOnce(Promise.resolve(null));

    try {
      await sut.execute(1);
    } catch (error) {
      expect(makeException.notFound).toHaveBeenCalledWith({
        message: 'Account not found!'
      });
      expect(error).toBeInstanceOf(Error);
    }
  });
});
