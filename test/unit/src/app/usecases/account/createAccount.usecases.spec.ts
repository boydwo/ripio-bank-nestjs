import { CreateAccountUseCases } from 'src/app/usecases/account/createAccount.usecases';
import { IException } from 'src/domain/protocols/exceptions/exceptions.interface';
import { ILogger } from 'src/domain/protocols/logger/logger.interface';
import { IAccountRepository } from 'src/domain/protocols/repositories/account.repository.interface';
import { accountMock } from 'test/unit/mocks/account.mock';
import {
  makeExceptionMock,
  makeLoggerMock
} from 'test/unit/mocks/factory.mock';

interface SutTypes {
  sut: CreateAccountUseCases;
  makeAccountRepository: IAccountRepository;
  makeException: IException;
  makeLogger: ILogger;
}

const makeSut = (): SutTypes => {
  const makeAccountRepository: IAccountRepository = {
    create: jest.fn().mockReturnValue(accountMock),
    findAll: jest.fn(),
    deleteById: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findByDocument: jest.fn().mockReturnValue(null),
  };

  const makeException = makeExceptionMock;
  const makeLogger = makeLoggerMock;

  const sut = new CreateAccountUseCases(
    makeAccountRepository,
    makeException,
    makeLogger,
  );
  return { sut, makeAccountRepository, makeException, makeLogger };
};
describe('app :: usecases :: account :: CreateAccountUseCases', () => {
  it('should call AccountRepository with correct values', async () => {
    const { sut, makeAccountRepository, makeLogger } = makeSut();

    await sut.execute(
      accountMock.name,
      accountMock.document,
      accountMock.email,
      accountMock.telephone,
      accountMock.address,
    );

    expect(makeAccountRepository.create).toHaveBeenCalledWith(
      'John Doe',
      '9999999999',
      'johnDoe',
      '55319999999',
      'Av das Palmeiras, 444, Bandeiranantes, 32415788, São Paulo, SP',
    );
  });

  it('should call Logger with correct values', async () => {
    const { sut, makeLogger } = makeSut();

    await sut.execute(
      accountMock.name,
      accountMock.document,
      accountMock.email,
      accountMock.telephone,
      accountMock.address,
    );

    expect(makeLogger.info).toHaveBeenCalledWith(
      'createAccountUseCases.execute',
      'Account John Doe created successfully',
    );
  });
  it('should throw if account already exists', async () => {
    const { sut, makeAccountRepository, makeException } = makeSut();
    jest
      .spyOn(makeAccountRepository, 'findByDocument')
      .mockReturnValueOnce(Promise.resolve(accountMock));

    try {
      await sut.execute(
        accountMock.name,
        accountMock.document,
        accountMock.email,
        accountMock.telephone,
        accountMock.address,
      );
    } catch (error) {
      expect(makeException.badRequest).toHaveBeenCalledWith({
        message: 'Account already exists!',
      });
      expect(error).toBeInstanceOf(Error);
    }
  });
});
