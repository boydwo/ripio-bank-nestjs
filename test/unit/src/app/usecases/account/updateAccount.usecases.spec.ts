import { UpdateAccountUseCases } from 'src/app/usecases/account/updateAccount.usecases';
import { IException } from 'src/domain/protocols/exceptions/exceptions.interface';
import { ILogger } from 'src/domain/protocols/logger/logger.interface';
import { IAccountRepository } from 'src/domain/protocols/repositories/account.repository.interface';
import { accountMock } from 'test/unit/mocks/account.mock';
import {
  makeExceptionMock,
  makeLoggerMock
} from 'test/unit/mocks/factory.mock';

interface SutTypes {
  sut: UpdateAccountUseCases;
  makeAccountRepository: IAccountRepository;
  makeException: IException;
  makeLogger: ILogger;
}

const makeSut = (): SutTypes => {
  const makeAccountRepository: IAccountRepository = {
    create: jest.fn().mockReturnValue(accountMock),
    findAll: jest.fn(),
    deleteById: jest.fn(),
    findById: jest.fn().mockReturnValue({ ...accountMock, id: 1 }),
    update: jest
      .fn()
      .mockReturnValue({ ...accountMock, id: 1, name: 'John Doe updated' }),
    findByDocument: jest.fn().mockReturnValue(null),
  };

  const makeException = makeExceptionMock;
  const makeLogger = makeLoggerMock;
  const sut = new UpdateAccountUseCases(
    makeAccountRepository,
    makeException,
    makeLogger,
  );
  return { sut, makeAccountRepository, makeException, makeLogger };
};
describe('app :: usecases :: account :: UpdateAccountUseCases', () => {
  const updateAccount = {
    name: 'John Doe updated',
  };
  it('should call AccountRepository with correct values', async () => {
    const { sut, makeAccountRepository } = makeSut();

    await sut.execute(1, updateAccount);

    expect(makeAccountRepository.update).toHaveBeenCalledWith(1, updateAccount);
  });
  it('should call Logger with correct values', async () => {
    const { sut, makeLogger } = makeSut();

    await sut.execute(1, updateAccount);

    expect(makeLogger.info).toHaveBeenCalledWith(
      'UpdateAccountUseCases.execute',
      'Account John Doe updated has been updated',
    );
  });
  it('should throw if account already exists', async () => {
    const { sut, makeAccountRepository, makeException } = makeSut();
    jest
      .spyOn(makeAccountRepository, 'findById')
      .mockReturnValueOnce(Promise.resolve(null));

    try {
      await sut.execute(1, updateAccount);
    } catch (error) {
      expect(makeException.notFound).toHaveBeenCalledWith({
        message: 'Account not found!',
      });
      expect(error).toBeInstanceOf(Error);
    }
  });
});
